import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const DeleteEventModal = ({ show, onHide, eventName, onConfirm, deleting }) => {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Xác Nhận Xóa</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Bạn có chắc chắn muốn xóa sự kiện <strong>{eventName}</strong>?
                <br />
                <small className="text-muted">Hành động này không thể hoàn tác.</small>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={deleting}>
                    Hủy
                </Button>
                <Button variant="danger" onClick={onConfirm} disabled={deleting}>
                    {deleting ? 'Đang xóa...' : 'Xóa'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteEventModal;
