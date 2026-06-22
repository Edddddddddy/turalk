const cards = ['待处理举报', '今日敏感操作', '待复核账号'];

export function DashboardPage() {
  return (
    <section>
      <span className="eyebrow">Dashboard</span>
      <h1>治理概览</h1>
      <p className="lead">指标均为占位，后台尚未连接 API。</p>
      <div className="metric-grid">
        {cards.map((card) => (
          <article className="metric-card" key={card}>
            <strong>--</strong>
            <span>{card}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
