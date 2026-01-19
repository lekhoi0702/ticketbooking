import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Space, Typography, message, Skeleton } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';

const { Text } = Typography;

const VenueLocationSearch = ({ form, mapPreviewUrl, setMapPreviewUrl }) => {
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // Watch form values for auto-search
    const watchedAddress = Form.useWatch('address', form);
    const watchedCity = Form.useWatch('city', form);

    useEffect(() => {
        if (!watchedAddress || watchedAddress.length <= 5) {
            setSearchResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const timer = setTimeout(() => {
            performSearch(watchedAddress, watchedCity || '');
        }, 1000); // 1s Debounce

        return () => clearTimeout(timer);
    }, [watchedAddress, watchedCity]);

    const performSearch = async (addr, city) => {
        try {
            // Encode the query
            const query = encodeURIComponent(`${addr} ${city ? ',' + city : ''}`);
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5&addressdetails=1`);
            const data = await response.json();

            if (data && data.length > 0) {
                setSearchResults(data);
            } else {
                setSearchResults([]);
            }
        } catch (err) {
            console.error("Search error", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectLocation = (item) => {
        // Generate iframe from lat/lon
        const embedCode = `<iframe width="100%" height="100%" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://maps.google.com/maps?q=${item.lat},${item.lon}&t=&z=15&ie=UTF8&iwloc=&output=embed"></iframe>`;
        form.setFieldsValue({ map_embed_code: embedCode });
        setMapPreviewUrl(embedCode);
        setSearchResults([]); // Clear list
        message.success("Đã chọn vị trí: " + (item.display_name.substring(0, 30) + "..."));
    };

    return (
        <div style={{ position: 'relative' }}>
            <Form.Item
                name="address"
                label="Địa chỉ chi tiết"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                style={{ marginBottom: 0 }}
            >
                <Input.TextArea rows={2} placeholder="Nhập địa chỉ, hệ thống sẽ tự động tìm kiếm..." />
            </Form.Item>

            {/* Search Results Dropdown */}
            {(loading || searchResults.length > 0) && (
                <div style={{
                    marginBottom: 24,
                    border: '1px solid #d9d9d9',
                    borderTop: 'none',
                    borderRadius: '0 0 8px 8px',
                    background: '#fff',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    position: 'relative' // Keeps it in flow but allows overlay feel if needed
                }}>
                    <div style={{ padding: '8px 12px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {loading ? 'Đang tìm kiếm...' : `Kết quả tìm kiếm (${searchResults.length}) - Chọn địa điểm đúng nhất:`}
                        </Text>
                    </div>
                    <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                        {loading ? (
                            <div style={{ padding: 12 }}>
                                <Skeleton active avatar paragraph={{ rows: 1 }} />
                                <Skeleton active avatar paragraph={{ rows: 1 }} />
                            </div>
                        ) : (
                            searchResults.map((item, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        padding: '10px 12px',
                                        borderBottom: '1px solid #f0f0f0',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'start'
                                    }}
                                    onClick={() => handleSelectLocation(item)}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#e6f7ff'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                                >
                                    <EnvironmentOutlined style={{ marginRight: 10, marginTop: 4, color: '#1890ff' }} />
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{item.display_name.split(',')[0]}</div>
                                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>{item.display_name}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Spacer if no results to restore spacing */}
            {!loading && searchResults.length === 0 && <div style={{ marginBottom: 24 }}></div>}

            {/* Hidden field for storage */}
            <Form.Item
                name="map_embed_code"
                label="Vị trí trên bản đồ"
                hidden={true}
            >
                <Input.TextArea />
            </Form.Item>

            {/* Map Preview */}
            {mapPreviewUrl && (
                <div style={{ marginBottom: 24, border: '1px solid #d9d9d9', borderRadius: 4, padding: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text strong>Vị trí đã chọn:</Text>
                        <Button type="link" size="small" onClick={() => {
                            setMapPreviewUrl(null);
                            form.setFieldsValue({ map_embed_code: '' });
                        }}>Xóa</Button>
                    </div>
                    <div
                        dangerouslySetInnerHTML={{ __html: mapPreviewUrl }}
                        style={{ width: '100%', height: '300px', overflow: 'hidden' }}
                    />
                </div>
            )}
        </div>
    );
};

export default VenueLocationSearch;
