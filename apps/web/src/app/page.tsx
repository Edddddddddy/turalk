import Link from 'next/link';

const principles = [
  ['后台实名', '身份核验数据与公开社区身份隔离。'],
  ['前台匿名', '玩家以社区昵称参与讨论。'],
  ['人工治理', '通过举报、复核与审计处理社区风险。'],
] as const;

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <span className="eyebrow">面向二游玩家的可信社区</span>
        <h1>认真讨论游戏，也认真保护你的身份。</h1>
        <p>
          Turalk 将后台实名认证与前台社区身份分离，为玩家提供可追责但不暴露真实身份的讨论空间。
        </p>
        <div className="actions">
          <Link className="button button-primary" href="/forums">
            浏览分区
          </Link>
          <Link className="button" href="/identity">
            了解实名机制
          </Link>
        </div>
      </section>

      <section className="card-grid" aria-label="社区原则">
        {principles.map(([title, description]) => (
          <article className="card" key={title}>
            <h2>{title}</h2>
            <p>{description}</p>
          </article>
        ))}
      </section>
    </>
  );
}
