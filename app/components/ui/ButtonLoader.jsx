export default function ButtonLoader({ text = "Loading..." }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
        aria-hidden="true"
      />
      {text}
    </span>
  );
}
