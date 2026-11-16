function Popup({ title, message, onConfirm, confirmText = "確認" }) {
  return (
    <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/40 p-4">
      <div className="flex w-full max-w-sm flex-col items-center justify-center rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <button
          type="button"
          className="mt-5 w-full rounded-xl bg-pink-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-pink-600"
          onClick={onConfirm}
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
}

export default Popup;
