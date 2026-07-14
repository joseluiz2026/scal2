export default function Toast({ message }: { message: string | null }) {
  return (
    <div className={`toast${message ? " show" : ""}`}>
      <span className="dot-ind" />
      <span>{message}</span>
    </div>
  );
}
