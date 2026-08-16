const path = require("path");
const dist = process.env.SANDSPIEL_DIST_DIR || path.resolve(__dirname, "dist");

const CopyWebpackPlugin = require("copy-webpack-plugin");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const { GenerateSW } = require("workbox-webpack-plugin");

const assetFiles = [
  "favicon-16x16.png", "favicon-32x32.png",
  "icon-72x72.png", "icon-96x96.png", "icon-128x128.png",
  "icon-144x144.png", "icon-152x152.png", "icon-192x192.png",
  "icon-384x384.png", "icon-512x512.png",
];

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";
  // The checked-in wasm package makes ordinary and Vercel builds deterministic.
  // Set SANDSPIEL_BUILD_WASM=1 when Rust code changes and a local toolchain is ready.
  const shouldBuildWasm =
    !process.env.VERCEL &&
    process.env.SANDSPIEL_BUILD_WASM === "1" &&
    process.env.SANDSPIEL_SKIP_WASM !== "1";

  const plugins = [
    new CleanWebpackPlugin(),
    ...(shouldBuildWasm ? [new WasmPackPlugin({
      crateDirectory: path.resolve(__dirname, "crate"),
      extraArgs: "--target bundler",
    })] : []),
    new CopyWebpackPlugin({
      patterns: [
        "js/styles.css",
        "manifest.json",
        ...assetFiles.map((file) => ({ from: `assets/${file}`, to: `assets/${file}` })),
      ],
    }),
    new HtmlWebpackPlugin({ template: "index.html", assetPrefix: "", view: "home" }),
    new HtmlWebpackPlugin({
      template: "index.html",
      filename: "info/index.html",
      publicPath: "../",
      assetPrefix: "../",
      view: "info",
    }),
    new HtmlWebpackPlugin({
      template: "index.html",
      filename: "bench/index.html",
      publicPath: "../",
      assetPrefix: "../",
      view: "bench",
    }),
  ];

  // Only add service worker in production to avoid watch mode warnings
  if (isProduction) {
    plugins.push(
      new GenerateSW({
        navigateFallback: "index.html",
        runtimeCaching: [
          {
            urlPattern: /\.html$/,
            handler: "StaleWhileRevalidate",
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 300,
              },
            },
          },
        ],
      })
    );
  }

  return {
    entry: "./js/bootstrap.js",
    output: {
      path: dist,
      filename: "[name].[contenthash].js",
      publicPath: "auto",
    },
    devServer: {
      static: dist,
      host: "127.0.0.1",
      allowedHosts: ["localhost", "127.0.0.1", "[::1]"],
      historyApiFallback: true,
    },
    experiments: {
      asyncWebAssembly: true,
    },
    mode: isProduction ? "production" : "development",
    devtool: "source-map",
    plugins,
  module: {
    rules: [
      {
        test: /\.(glsl|frag|vert)$/,
        use: {
          loader: "raw-loader",
          options: { esModule: false },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(glsl|frag|vert)$/,
        use: "glslify-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },

      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
            plugins: ["@babel/plugin-syntax-dynamic-import"],
          },
        },
      },
    ],
  },
  };
};
