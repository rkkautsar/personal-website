import { navigation } from '@/data/navigation';

export function SectionNav({ mobile = false }: { mobile?: boolean }) {
  return (
    <nav aria-label="Page sections" className={mobile ? 'mobile-nav' : 'desktop-nav'}>
      {navigation.map(({ id, label }, index) => (
        <a key={id} href={`#${id}`}>
          <span className="nav-index">0{index + 1}</span>
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}
