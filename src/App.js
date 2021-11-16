import {
    notification,
    Table
} from "antd";
import "antd/dist/antd.css";
import {
    useEffect,
    useState
} from "react";
import axios from "axios";
import Select from "react-select";

function App() {

    const filters = {
        NOFILTER: "No Filter",
        PHONEVALIDITY: "PhoneValidity",
        COUNTRYNAME: "CountryName",
        FULLNUMBER: "FullNumber"
    };

    const filtersListOptions = [{
            value: filters.NOFILTER,
            label: "No Filter"
        },
        {
            value: filters.PHONEVALIDITY,
            label: "Valid Phone only"
        },
        {
            value: filters.COUNTRYNAME,
            label: "Country Name"
        },
        {
            value: filters.FULLNUMBER,
            label: "Full Number"
        }
    ];

    const columns = [{
            title: "Phone Number",
            dataIndex: "phone",
            key: "phone"
        },
        {
            title: "Customer Name",
            dataIndex: "name",
            key: "name"
        }
    ];

    const inputArr = [{
        type: "text",
        id: 1,
        value: ""
    }];

    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        total: 100
    })
    const [rows, setRows] = useState([])
    const [selectedOption, setSelectedOption] = useState(null)
    const [filter, setFilter] = useState(null)
    const [inputs, setInputs] = useState([])

    const getData = (filter, page, size) => {
        let requestParams = {
            page: page,
            size: size
        };

        if (filter != null && filter.key != null) {
            switch (filter.key) {
                case filters.PHONEVALIDITY:
                    requestParams.validPhoneNumbersOnly = true;
                    break;
                case filters.COUNTRYNAME:
                    requestParams.countryName = filter.value;
                    break;
                case filters.FULLNUMBER:
                    requestParams.countryCode = filter.value.countryCode;
                    requestParams.localNumber = filter.value.localNumber;
                    break;
                case filters.NOFILTER:
                    requestParams = {};
                default:
                    console.log("No filter");
            }
        }

        axios.get('http://localhost:8080/api/customer', {
            params: requestParams
        }).then((response) => {
            const newPagination = {
                page,
                size,
                total: response.data.totalPages
            }
            setPagination(newPagination)
            setRows(response.data.customers)
        }).catch((error) => {
            if (error.response) {
                notification.error({
                    title: 'Error',
                    description: error.response.data
                })
            } else {
                if (error.request) {
                    notification.error({
                        title: 'Error',
                        description: "Can't reach the backend server, please adjust the url"
                    })
                }
            }
        })
    }

    useEffect(() => {
        getData(filter, pagination.page, pagination.size);
    }, [filter]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (e.target[0].name === filters.COUNTRYNAME)
            setFilter({
                key: filters.COUNTRYNAME,
                value: e.target[0].value
            });
        else {
            setFilter({
                key: filters.FULLNUMBER,
                value: {
                    "countryCode": e.target[0].value,
                    "localNumber": e.target[1].value   
                }
            });
        }
    }

    const filterListHandleChange = (selectedOption) => {
        setSelectedOption(selectedOption);
        switch (selectedOption.value) {
            case filters.PHONEVALIDITY:
                setInputs([]);
                setFilter({
                    key: selectedOption.value,
                    value: true
                });
                break;
            case filters.COUNTRYNAME:
                setInputs([{
                    name: "CountryName"
                }]);
                break;
            case filters.FULLNUMBER:
                setInputs([{
                    name: "countryCode"
                }, {
                    name: "localNumber"
                }]);
                break;
            case filters.NOFILTER:
                setInputs([]);
                setFilter({
                    key: filters.NOFILTER,
                    value: true
                });
                break;
            default:
                setInputs([]);
        }
    };

    return ( <
        div style = {
            {
                marginTop: 20,
                marginLeft: 50
            }
        } >
        <
        br / >
        <
        div style = {
            {
                width: '300px'
            }
        } >
        <
        label > Filter customers list < /label> <
        Select value = {
            selectedOption
        }
        onChange = {
            filterListHandleChange
        }
        menuPosition = "fixed"
        options = {
            filtersListOptions
        }
        /> <
        /div> <
        div style = {
            {
                marginTop: 20
            }
        } > {
            inputs.length ? ( <
                form onSubmit = {
                    handleSearch
                } > {
                    inputs.map((x, i) => {
                        return ( <
                            div className = "box"
                            style = {
                                {
                                    marginTop: 10
                                }
                            } >
                            <
                            label > {
                                x.name
                            } < /label> <
                            input style = {
                                {
                                    marginLeft: 20
                                }
                            }
                            name = {
                                x.name
                            }
                            value = {
                                x.value
                            }
                            /> <
                            /div>
                        );
                    })
                } <
                button style = {
                    {
                        marginTop: 20
                    }
                }
                type = "submit" > Search < /button> <
                /form>
            ) : ""
        } <
        /div> <
        br / >
        <
        Table columns = {
            columns
        }
        dataSource = {
            rows
        }
        rowKey = {
            record => record.phone
        }
        style = {
            {
                width: '75%',
                height: '100%',
                display: 'block',
                marginLeft: 'auto',
                marginRight: 'auto'
            }
        }
        pagination = {
            pagination
        }
        onChange = {
            (paginationChanged) => {
                getData(filter, paginationChanged.current - 1, paginationChanged.size);
            }
        } >

        <
        /Table> <
        /div>
    );
}

export default App;