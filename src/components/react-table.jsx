import React, {
    useState,
    useEffect,
    useMemo,
    useRef,
    useCallback,
} from 'react';
import {
    useTable,
    usePagination,
    useSortBy,
    useGlobalFilter,
} from 'react-table';

const ReactTable = () => {
    const [transactionDetail, settransactionDetail] = useState([]);
    const [controlledPageCount, setcontrolledPageCount] = useState(0);
    const fetchIdRef = useRef(0);

    const fetchData = useCallback(async ({ pageIndex, pageSize }) => {
        // This will get called when the table needs new data
        // You could fetch your data from a server.

        // Give this fetch an ID
        const fetchId = ++fetchIdRef.current;

        // Set the loading state
        //setLoading(true)

        // Only update the data if this is the latest fetch
        if (fetchId === fetchIdRef.current) {
            let countReal = 0;
            const startRow = pageSize * pageIndex;
            const endRow = startRow + pageSize;

            const response = await getTransactionHistory({
                skip: startRow,
                limit: pageSize,
                type: 'deposit'
            });

            if (response.status === 200) {
                let { transactiondetail, count } = response.data || {};
                countReal = count;
                if (transactiondetail.length !== 0) {
                    let newpayload = transactiondetail.map(ele => {
                        return {
                            transactionTime: ele.transactionTime,
                            fromAccount: ele.fromAccount,
                            toAccount: ele.toAccount,
                            network: ele.network,
                            chainId: ele.chainId,
                            blockChain: ele.blockChain,
                            hash: ele.hash,
                            amount: ele.amount,
                        };
                    });

                    settransactionDetail(newpayload);
                } else {
                    settransactionDetail([]);
                }
            } else {
                settransactionDetail([]
                );
            }
            //setData(serverData.slice(startRow, endRow))

            // Your server could send back total page count.
            // For now we'll just fake it, too
            if (countReal) {
                console.log('this is the calculaion', Math.ceil(countReal / pageSize));
                setcontrolledPageCount(Math.ceil(countReal / pageSize));
            }

            //setLoading(false)
        }
    }, []);

    const tableData = useMemo(() => [...transactionDetail], [transactionDetail]);

    const columns = useMemo(
        () => [
            {
                Header: 'Date',
                accessor: 'transactionTime',
                Cell: ({ cell: { value } }) => <CustomDate value={value} />,
            },
            {
                Header: 'Sender',
                accessor: 'fromAccount',
                Cell: ({ cell: { value } }) => (
                    <CustomAddress
                        value1={value}
                        title1={'Sender Address'}
                        description1={'Meta Mask Sender Addresss'}
                    />
                ),
            },
            {
                Header: 'Receiver',
                accessor: 'toAccount',
                Cell: ({ cell: { value } }) => (
                    <CustomAddress
                        value1={value}
                        title1={'Receiver Address'}
                        description1={'Note: This is your Moon Bet Wallet Address'}
                    />
                ),
            },
            {
                Header: 'Network',
                accessor: 'network',
                Cell: ({ cell: { value } }) => <CapitalizeNetwork value={value} />,
            },
            {
                Header: 'Chain',
                accessor: 'chainId',
            },
            {
                Header: 'Blockchain',
                accessor: 'blockChain',
                Cell: ({ cell: { value } }) => <CustomImage value={value} />,
            },
            {
                Header: 'Hash',
                accessor: 'hash',
                Cell: ({ cell: { value } }) => (
                    <CustomAddress
                        value1={value}
                        title1={'Transaction Hash'}
                        description1={
                            'Copy the Transaction Hash and check it on the Etherscan'
                        }
                    />
                ),
            },
            {
                Header: 'Amount',
                accessor: 'amount',
            },
        ],
        [],
    );


    const tableInstance = useTable(
        {
            columns: columns,
            data: tableData,
            initialState: { pageIndex: 0 },
            manualPagination: true,
            autoResetPage: false,
            pageCount: controlledPageCount,
        },
        useGlobalFilter,
        useSortBy,
        usePagination,
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        preGlobalFilteredRows,
        setGlobalFilter,
        // Get the state from the instance
        state: { pageIndex, pageSize, globalFilter },
    } = tableInstance;

    useEffect(() => {
        fetchData({ pageIndex, pageSize });
    }, [pageIndex, pageSize]);


    return (
        <>
            <div className={styles['transactionHeading-section']}>
                <h5>Deposit</h5>
            </div>

            <div>
                <div className="table-responsive">
                    <table className="table" {...getTableProps()}>
                        <thead>
                            {headerGroups.map(headerGroup => (
                                <tr {...headerGroup.getHeaderGroupProps()}>
                                    {headerGroup.headers.map(column => (
                                        <th
                                            {...column.getHeaderProps(column.getSortByToggleProps())}>
                                            {column.render('Header')}
                                            <span
                                                className={`fa${ column.isSorted
                                                        ? column.isSortedDesc
                                                            ? ' fa-caret-square-down'
                                                            : ' fa-caret-square-up'
                                                        : ''
                                                    }`}></span>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody {...getTableBodyProps()}>
                            {rows.map(row => {
                                prepareRow(row);

                                return (
                                    <tr {...row.getRowProps()}>
                                        {row.cells.map(cell => (
                                            <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Starts */}
                <div className="table-pagination-section">
                    <div className="pagination-pages">
                        <span className="currentPage-info">
                            Page{' '}
                            <strong>
                                <span className="currPage">{pageIndex + 1}</span> of{' '}
                                <span className="totalPages">{pageOptions.length}</span>
                            </strong>{' '}
                        </span>
                        <span className="pagination-jump">
                            Go to page :{' '}
                            <input
                                type="number"
                                defaultValue={pageIndex + 1}
                                onChange={e => {
                                    const page = e.target.value ? Number(e.target.value) - 1 : 0;
                                    gotoPage(page);
                                }}
                            />
                        </span>{' '}
                    </div>
                    <div className="paginationRight">
                        <div className="pagination-btns">
                            <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                                <i className="fa fa-angle-double-left"></i>
                            </button>{' '}
                            <button
                                onClick={() => previousPage()}
                                disabled={!canPreviousPage}>
                                <i className="fa fa-angle-left"></i>
                            </button>{' '}
                            <button onClick={() => nextPage()} disabled={!canNextPage}>
                                <i className="fa fa-angle-right"></i>
                            </button>{' '}
                            <button
                                onClick={() => gotoPage(pageCount - 1)}
                                disabled={!canNextPage}>
                                <i className="fa fa-angle-double-right"></i>
                            </button>{' '}
                        </div>
                        <select
                            className="pagination-select"
                            value={pageSize}
                            onChange={e => {
                                setPageSize(Number(e.target.value));
                            }}>
                            {[10, 20, 30, 40, 50].map(pageSize => (
                                <option key={pageSize} value={pageSize}>
                                    Show {pageSize}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                {/* Pagination Ends */}
            </div>

        </>

    )
}


const CustomDate = ({ value }) => {
    return <>{new Date(value).toLocaleDateString()}</>;
  };
  
  const CustomAddress = ({ value1, title1, description1 }) => {
    const [show, setShow] = useState(false);
    // const [title,setTitle]=useState(title1);
    // const [description,setDescription]=useState(description1)
    // const [info,setInfo]=useState(value1)
  
    const handleShow = () => {
      setShow(prev => !prev);
    };
    console.log('this is the value', value1);
    return (
      <>
        <div>
        <OverlayTrigger 
          overlay={
            <Tooltip id={`tooltip-right`} className={styles['overlayContent']}>
              <span>Show Full</span>
            </Tooltip>
          }>
          <span onClick={handleShow}>{value1?.slice(0, 5)}...</span>
        </OverlayTrigger>
          
          <ModalPoup
            show={show}
            handleShow={handleShow}
            info={value1}
            title={title1}
            description={description1}
          />
        </div>
      </>
    );
  };
  
  const ModalPoup = ({ show, handleShow, title, description, info }) => (
    <Modal show={show} onHide={handleShow} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className={styles['transactionCopySection']}>
          <span className={styles['label']}>{description}</span>
          <ClipboardCopy displayText={info} copyText={info} />
        </div>
      </Modal.Body>
    </Modal>
  );
  
  const CustomImage = ({ value }) => {
    console.log('this is the custom Image', value);
    let image = ExtraImage(value);
  
    return (
      <div className={styles1['bitcoin']}>
        {image} <span>{value}</span>
      </div>
    );
  };
  
  const CapitalizeNetwork = ({ value }) => {
    const convertCapitalize = val => {
      const str = val;
      if (str === undefined || str === null || str === '') return '';
      const str2 = str.charAt(0).toUpperCase() + str.slice(1);
      return str2;
    };
    return <>{convertCapitalize(value)}</>;
  };
export default ReactTable