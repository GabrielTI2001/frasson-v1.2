import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { useAppContext } from "../../../Main";
import {format} from 'date-fns'
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

const APPOTable = ({
  getTableProps,
  headers,
  page,
  prepareRow,
  headerClassName,
  bodyClassName,
  rowClassName,
  tableProps,
  Click
}) => {
  const {config: {theme}} = useAppContext();
  return (
    <div className="table-responsive scrollbar fs-xs">
      <Table {...getTableProps(tableProps)}>
        <thead className={headerClassName+' '+'bg-300'}>
          <tr>
            {headers.map((column, index) => (
              <th
                key={index}
                {...column.getHeaderProps(
                  column.getSortByToggleProps(column.headerProps)
                )}
              >
                {column.render('Header')}
                {column.canSort ? (
                  column.isSorted ? (
                    column.isSortedDesc ? (
                      <span className="sort desc" />
                    ) : (
                      <span className="sort asc" />
                    )
                  ) : (
                    <span className="sort" />
                  )
                ) : (
                  ''
                )}
              </th>
            ))}
            <th className='text-900 p-1'>REAPPO</th>
          </tr>
        </thead>
        <tbody className={bodyClassName+' '+`${theme === 'light' ? 'bg-light': 'bg-200'}`}>
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <tr key={i} className={rowClassName+`${theme === 'light'? ' hover-table-light' : ' hover-table-dark'}`} {...row.getRowProps()} onClick={() => !tableProps.showactions 
              && (Click(row.original.id, row.original.uuid))}>
                {row.cells.map((cell, index) => {
                  return (
                    <td
                      key={index}
                      {...cell.getCellProps(cell.column.cellProps)}
                    >
                      {tableProps.index_status && index === tableProps.index_status && row.original.data_vencimento ? 
                      <OverlayTrigger
                        overlay={
                          <Tooltip style={{ position: 'fixed', fontSize: '10px', padding: '2px !important' }} id="overlay-trigger-example">
                            {`${row.original.status.text === 'Vigente' ? 'Vence' : 'Venceu' } em 
                            ${format(new Date(row.original.data_vencimento), 'dd/MM/yyyy')}`}
                          </Tooltip>
                        }
                      >
                        <span className={`text-${row.original.status.color} py-1 px-3 fw-bold`}>{row.original.status.text}</span>
                      </OverlayTrigger>
                      : cell.render('Cell')}
                    </td>
                  );
                })}
                {row.original.renovacao &&
                <td>  
                  <OverlayTrigger
                    overlay={
                      <Tooltip style={{ position: 'fixed', fontSize: '10px', padding: '2px !important' }} id="overlay-trigger-example">
                        {`${new Date(row.original.renovacao.data) > new Date() ? 'Vence' : 'Venceu'} em 
                          ${format(new Date(row.original.renovacao.data), 'dd/MM/yyyy')}`}
                      </Tooltip>
                    }
                  >
                    {new Date(row.original.renovacao.data) < new Date()
                      ?<span className="text-warning py-1 px-3 fw-bold">Vencido</span>
                      :<span className="text-success py-1 px-3 fw-bold">Vigente</span>
                    }
                  </OverlayTrigger>
                </td>}
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};
APPOTable.propTypes = {
  getTableProps: PropTypes.func,
  headers: PropTypes.array,
  page: PropTypes.array,
  prepareRow: PropTypes.func,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  rowClassName: PropTypes.string,
  tableProps: PropTypes.object
};

export default APPOTable;
