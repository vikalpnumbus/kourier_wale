
const ImageModal = ({ imageUrl, onClose }) => {
  return (
    <div
      className="modal fade show"
      style={{
        display: "block",
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      onClick={onClose} 
    >
      <div
        className="modal-dialog"
        role="document"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="modal-content">
          <div className="modal-header py-1">
            <h5 className="modal-title">Cancel Cheque Image</h5>
            <button
              type="button"
              className="close"
              onClick={onClose} 
              aria-label="Close"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div className="modal-body text-center">
            <img
              src={imageUrl}
              alt="Preview"
              className="img-fluid rounded"
              style={{ maxHeight: "70vh" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal ;
