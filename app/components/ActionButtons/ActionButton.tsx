import React from 'react';

interface ActionButtonsProps {
  onSave: () => Promise<void>;
  onPrint: () => Promise<void>;
  onEmail: () => Promise<void>;
  onReset: () => void;
  onExit: () => void;
  onHold: () => void;
  isSaving: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onSave,
  onPrint,
  onEmail,
  onReset,
  onExit,
  onHold,
  isSaving
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 mt-4">
      <div className="flex space-x-2">
        <button 
          className="btn bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium shadow-sm disabled:opacity-50"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button 
          className="btn bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md font-medium shadow-sm disabled:opacity-50"
          onClick={onPrint}
          disabled={isSaving}
        >
          Save & Print
        </button>
        <button 
          className="btn bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium shadow-sm disabled:opacity-50"
          onClick={onEmail}
          disabled={isSaving}
        >
          Save & Email
        </button>
      </div>
      
      <div className="flex space-x-2">
        <button 
          className="btn bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md font-medium shadow-sm"
          onClick={onReset}
        >
          Reset
        </button>
        <button 
          className="btn bg-gray-400 hover:bg-gray-500 px-4 py-2 rounded-md font-medium shadow-sm"
          onClick={onExit}
        >
          Exit
        </button>
        <button 
          className="btn bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md font-medium shadow-sm"
          onClick={onHold}
        >
          Hold
        </button>
      </div>
    </div>
  );
};

export default ActionButtons;