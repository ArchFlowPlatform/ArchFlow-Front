interface ProjectsHeaderProps {
  title: string;
  description: string;
}

export default function ProjectsHeader({
  title,
  description,
}: ProjectsHeaderProps) {
  return (
    <header className="af-surface-lg af-separator-b bg-[#14121a]/75 px-4 py-4 sm:px-5">
      <h1 className="text-lg font-semibold text-white sm:text-xl">{title}</h1>
      <p className="af-text-secondary mt-1 text-sm">{description}</p>
    </header>
  );
}
