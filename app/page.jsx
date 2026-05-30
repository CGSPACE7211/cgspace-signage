import { redirect } from 'next/navigation';

export default function HomePage() {
  // 踩进首页正门，一脚踹进标牌战场
  redirect('/signage');
}
