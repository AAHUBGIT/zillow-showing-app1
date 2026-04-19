export function RouteMapPreview({
  embedLink,
  title
}: {
  embedLink: string;
  title: string;
}) {
  return (
    <div className="overflow-hidden rounded-4xl border border-line/80 bg-slate-100 shadow-soft">
      {embedLink ? (
        <iframe
          title={title}
          src={embedLink}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-60 w-full border-0"
        />
      ) : (
        <div className="flex h-60 items-center justify-center px-6 text-center text-sm text-slate-500">
          Add scheduled stops to see a quick map preview here.
        </div>
      )}
    </div>
  );
}
