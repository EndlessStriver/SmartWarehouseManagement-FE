import { CloseButton, Table } from "react-bootstrap"
import { OverLay } from "../../../compoments/OverLay/OverLay"
import React from "react";
import SuggestExportLocations from "../../../services/StockEntry/SuggestExportLocations";
import { useDispatchMessage } from "../../../Context/ContextMessage";
import ActionTypeEnum from "../../../enum/ActionTypeEnum";

interface ModelRecomandLocationOrderExportProps {
    onClose: () => void,
    skuId: string,
    unitId: string,
    typeShelf: string,
    quantity: number,
    locations: { locationCode: string, quantity: number }[]
    updateLocations: (skuId: string, locations: { locationCode: string, quantity: number }[]) => void
}

interface Location {
    locationCode: string;
    quantityToExport: number;
    numberExport: number;
}


const ModelRecomedLocationOrderExport: React.FC<ModelRecomandLocationOrderExportProps> = (props) => {

    const dispatch = useDispatchMessage();
    const [locations, setLocations] = React.useState<Location[]>([]);

    React.useEffect(() => {
        SuggestExportLocations({
            quantity: props.quantity,
            skuId: props.skuId,
            typeShelf: props.typeShelf,
            unitId: props.unitId
        }).then((data) => {
            if (data) {
                setLocations(() => {
                    return data.map((location) => {
                        return {
                            locationCode: location.locationCode,
                            quantityToExport: location.quantityToExport,
                            numberExport: props.locations.find((loc) => loc.locationCode === location.locationCode)?.quantity || 0
                        }
                    })
                });
            }
        }).catch((error) => {
            dispatch({ message: error.message, type: ActionTypeEnum.ERROR });
            console.error(error);
        })
    }, [props.quantity, props.skuId, props.typeShelf, props.unitId, dispatch, props.locations]);

    const validate = () => {
        let sumQuantity = locations.reduce((sum, location) => sum + location.numberExport, 0);
        if (sumQuantity !== props.quantity) {
            dispatch({ message: "Tổng số lượng xuất không bằng số lượng cần xuất", type: ActionTypeEnum.ERROR });
            return false;
        }
        return true;
    }

    const handleSubmit = () => {
        if (validate()) {
            props.updateLocations(props.skuId, locations.map((location) => {
                return {
                    locationCode: location.locationCode,
                    quantity: location.numberExport
                }
            }));
            props.onClose();
        }
    }

    return (
        <OverLay>
            <div className="bg-light rounded position-relative p-4" style={{ width: "800px" }}>
                <CloseButton onClick={() => props.onClose()} className="position-absolute" style={{ top: "15px", right: "15px" }} />
                <h2>Danh sách đề xuất vị trí xuất hàng</h2>
                <Table striped bordered hover >
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Vị trí</th>
                            <th>Số lượng đang chứa</th>
                            <th>Số lượng muốn xuất</th>
                        </tr>
                    </thead>
                    <tbody>
                        {locations.map((location, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{location.locationCode}</td>
                                <td>{location.quantityToExport}</td>
                                <td style={{ width: "200px" }}>
                                    <input
                                        min={0}
                                        max={location.quantityToExport}
                                        type="number"
                                        className="form-control"
                                        placeholder="Số lượng xuất..."
                                        value={location.numberExport}
                                        onChange={(e) => {
                                            setLocations((prev) => {
                                                return prev.map((loc) => {
                                                    if (loc.locationCode === location.locationCode) {
                                                        return {
                                                            ...loc,
                                                            numberExport: parseInt(e.target.value)
                                                        }
                                                    }
                                                    return loc;
                                                })
                                            })
                                        }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                <div className="d-flex justify-content-end">
                    <button
                        onClick={() => handleSubmit()}
                        className="btn btn-primary"
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </OverLay>
    )
}

export default ModelRecomedLocationOrderExport