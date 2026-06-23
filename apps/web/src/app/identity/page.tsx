import type { Metadata } from 'next';

export const metadata: Metadata = { title: '实名认证说明' };

export default function IdentityPage() {
  return (
    <section className="content-card">
      <span className="eyebrow">Privacy by design</span>
      <h1>实名认证如何保护你</h1>
      <p>
        认证结果与论坛公开资料隔离。平台不保存身份证号码明文，普通管理员默认无权查看实名信息。
      </p>
      <p>
        当前尚未接入真实实名认证服务。后续会采用“后台实名、前台匿名”的方式，
        但本页面不会采集身份证号，也不会提供身份证输入框。
      </p>
    </section>
  );
}
