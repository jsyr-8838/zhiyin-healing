/**
 * (main) 路由组布局
 *
 * 包装所有主流程页面，自动注入 BottomNav。
 * 迁移说明：将需要 BottomNav 的页面目录移入 (main)/ 下即可自动生效。
 * 例如：dashboard/ → (main)/dashboard/
 *
 * 注意：(main) 是路由组，不会出现在 URL 中。
 * 暂时留空，等 Phase 3 逐页迁移时逐步将页面目录移入。
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 迁移完成后取消注释：
  // import BottomNav from '@/components/BottomNav';
  // return (
  //   <>
  //     {children}
  //     <BottomNav />
  //   </>
  // );
  return <>{children}</>;
}
