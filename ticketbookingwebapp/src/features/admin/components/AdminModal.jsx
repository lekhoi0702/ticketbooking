import React, { memo } from 'react';
import { Modal, Typography } from 'antd';

const { Text } = Typography;

const AdminModal = ({
    open,
    onCancel,
    title,
    children,
    footer,
    width = 520,
    confirmLoading = false,
    destroyOnClose = true,
    maskClosable = false,
    okText = 'Lưu',
    cancelText = 'Hủy',
    onOk,
    closable = true,
    ...rest
}) => {
    const useCustomFooter = footer !== undefined;

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            title={typeof title === 'string' ? <Text strong style={{ fontSize: 16 }}>{title}</Text> : title}
            footer={useCustomFooter ? footer : undefined}
            width={width}
            confirmLoading={confirmLoading}
            destroyOnClose={destroyOnClose}
            maskClosable={maskClosable}
            okText={okText}
            cancelText={cancelText}
            onOk={onOk}
            closable={closable}
            {...rest}
        >
            {children}
        </Modal>
    );
};

export default memo(AdminModal);
