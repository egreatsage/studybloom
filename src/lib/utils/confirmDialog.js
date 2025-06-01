import { toast } from 'react-hot-toast';

export const confirmDialog = (message) => {
  return new Promise((resolve) => {
    toast.custom(
      (t) => (
        <div className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex flex-col ring-1 ring-black ring-opacity-5`}>
          <div className="p-4">
            <div className="flex items-start">
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {message}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-t border-gray-200">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
              className="w-full border border-transparent rounded-none rounded-bl-lg px-4 py-3 flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className="w-full border border-transparent rounded-none rounded-br-lg px-4 py-3 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none border-l border-gray-200"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
      }
    );
  });
};
