export default function Layout({ children }) {
  return (
    <div className="p-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        {children}
      </div>
    </div>
  );
}
