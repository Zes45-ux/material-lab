import React from "react";

const Info = () => {
  return (
    <div className="Info">
      <h1>Material Lab</h1>
      <p aria-label="由 Max Bittker 创作">
        由 <a href="https://maxbittker.com">Max Bittker</a> 创作
      </p>
      <hr />
      <br />
      <p>
        欢迎光临，感谢你的到来！希望你享受探索这个小游戏的过程，并从中获得片刻宁静。{" "}
      </p>
      <p>
        成长过程中，这类“落沙”游戏曾带给我数小时的乐趣和想象力。我要特别感谢 ha55ii 的{" "}
        <a href="https://dan-ball.jp/en/javagame/dust/">Powder Game</a>，它是 Sandspiel 的主要灵感来源。
      </p>
      <br />
      <p>
        如果你想进一步了解这款游戏的灵感、架构和历史，我写过一篇博客文章（中间部分会涉及一些技术细节）：&nbsp;
        <a href="https://maxbittker.com/making-sandspiel">Making Sandspiel</a>。
      </p>
      <br />
      <p>
        如果愿意，你可以在 GitHub 查看{" "}
        <a href="https://github.com/maxbittker/sandspiel">源代码</a>，或{" "}
        <a href="https://github.com/maxbittker/sandspiel/issues">报告问题</a>；也欢迎在 Twitter 联系我，我会尽力回复！
      </p>
      <br />
      <p>
        最后想说：如果你喜欢这个本地沙盒，欢迎把它当作一段安静的探索时间。我会尽力让 Sandspiel 成为一个友善、包容的游玩空间，拒绝霸凌、种族主义、跨性别歧视、同性恋歧视及任何其他形式的偏见。如果哪里出了问题，或我能提供帮助，欢迎通过 <a href="mailto:maxbittker@gmail.com">maxbittker@gmail.com</a> 或 <a href="https://twitter.com/maxbittker">Twitter 上的 @maxbittker</a> 联系我。
      </p>
      <br />
      <hr />
      <br />
      <h2>材料说明</h2>
      <h4>墙</h4>
      坚不可摧。
      <h4>沙</h4>
      会沉入水中。
      <h4>雪</h4>
      像沙一样下落和堆积；持续接触火或岩浆时会逐步融化成水。
      <h4>水</h4>
      可以灭火。
      <h4>石头</h4>
      会形成拱形，在压力下会变成沙。
      <h4>冰</h4>
      能冻结水，而且很滑！
      <h4>气体</h4>
      极易燃！
      <h4>复制器</h4>
      会复制它接触到的第一种材料。
      <h4>螨虫</h4>
      会吃木头和植物，却最喜欢粉尘！能在冰上滑行。
      <h4>木头</h4>
      结实，但可以被生物降解。
      <h4>植物</h4>
      在潮湿环境中茁壮生长。
      <h4>真菌</h4>
      会蔓延到所有地方。
      <h4>种子</h4>
      能在沙、植物和真菌上生长。
      <h4>火</h4>
      很热！
      <h4>岩浆</h4>
      易燃而且很重。
      <h4>酸液</h4>
      会腐蚀其他材料。
      <h4>粉尘</h4>
      轻盈易飘散的助燃颗粒，可被火焰点燃并帮助火焰向相邻位置传播；承受高压时立即转为火焰。
      <h4>油</h4>
      点燃后会产生烟雾。
      <h4>火药</h4>
      会沉降；点燃后约 5 秒倒计时；普通引信可被相邻水格熄灭；最后一 tick 仍爆炸，压力超过 120 时直接引爆。
      <h4>火箭</h4>
      会爆炸成它接触到的第一种材料的复制品。
      <h4>清除</h4>
      用于擦除。
      <hr />
      <hr />
      <hr />
      <hr />
    </div>
  );
};

export default Info;
