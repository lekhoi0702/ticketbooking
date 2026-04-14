import React, { useEffect, useState } from 'react';
import { Alert, Card, Tag, Typography } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import { api } from '@services/api';
import AdminLoadingScreen from '@features/admin/components/AdminLoadingScreen';
import AdminTable from '@features/admin/components/AdminTable';
import AdminToolbar from '@features/admin/components/AdminToolbar';
import { getImageUrl } from '@shared/utils/eventUtils';

const { Text } = Typography;

const Banners = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const response = await api.getBanners();
            if (response.success) {
                setBanners(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching banners:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Hinh anh',
            dataIndex: 'image',
            key: 'image',
            width: 180,
            render: (url) => (
                <img
                    src={getImageUrl(url)}
                    alt="banner"
                    style={{ width: '140px', height: '70px', objectFit: 'cover', borderRadius: '6px' }}
                />
            ),
        },
        {
            title: 'Tieu de',
            dataIndex: 'title',
            key: 'title',
            render: (text) => <Text strong>{text || '-'}</Text>,
        },
        {
            title: 'Lien ket',
            dataIndex: 'url',
            key: 'url',
            render: (text) => (
                text ? <a href={text} target="_blank" rel="noreferrer"><LinkOutlined /> Link</a> : '-'
            ),
        },
        {
            title: 'Thu tu',
            dataIndex: 'display_order',
            key: 'display_order',
            width: 100,
            align: 'center',
        },
        {
            title: 'Trang thai',
            dataIndex: 'is_active',
            key: 'is_active',
            width: 120,
            render: (isActive) => <Tag color={isActive ? 'success' : 'default'}>{isActive ? 'HIEN' : 'AN'}</Tag>,
        },
    ];

    if (loading) return <AdminLoadingScreen tip="Dang tai banner..." />;

    return (
        <div style={{ paddingTop: 0 }}>
            <Alert
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
                message="Trang banner hien tai chi de xem. Du lieu quang cao dang duoc lay tu file cau hinh tinh."
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
                <AdminToolbar onRefresh={fetchBanners} refreshLoading={loading} />
            </div>

            <Card className="shadow-sm">
                <AdminTable
                    columns={columns}
                    dataSource={banners}
                    rowKey={(record) => record.banner_id || record.id || record.image}
                    pagination={{ pageSize: 50 }}
                    emptyText="Khong co banner"
                />
            </Card>
        </div>
    );
};

export default Banners;
