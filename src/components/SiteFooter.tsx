export function SiteFooter({ name }: { name: string }) {
  return (
    <footer className="site-footer">
      <span>
        © {new Date().getFullYear()} {name}
      </span>
      <a
        href="https://github.com/rkkautsar/personal-website"
        target="_blank"
        rel="noreferrer"
      >
        Source
      </a>
    </footer>
  );
}
