import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { useAppContext } from "../../../Main";
import SubtleBadge from '../../../components/common/SubtleBadge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faPen } from '@fortawesome/free-solid-svg-icons';

const PocoTable = ({
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
            <th className='text-900 p-1'>Data Perfuração</th>
            <th className='text-900 p-1'>Poço Perfurado</th>
            {tableProps.showactions &&(
              <th className='text-900 p-1'>Ações</th>
            )}
          </tr>
        </thead>
        <tbody className={bodyClassName+' '+`${theme === 'light' ? 'bg-light': 'bg-200'}`}>
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <tr key={i} className={rowClassName+`${theme === 'light'? ' hover-table-light' : ' hover-table-dark'}`} {...row.getRowProps()} onClick={() => !tableProps.showactions 
              && (Click(row.original.uuid))}>
                {row.cells.map((cell, index) => {
                  return (
                    <td
                      key={index}
                      {...cell.getCellProps(cell.column.cellProps)}
                    >
                      {tableProps.index_status && index === tableProps.index_status? 
                      <SubtleBadge bg={row.original.status.color} className='fw-bold'>{row.original.status.text}</SubtleBadge>
                      : cell.render('Cell')}
                    </td>
                  );
                })}
                <td className='text-center'>{row.original.data_perfuracao ? new Date(row.original.data_perfuracao).toLocaleDateString('pt-BR', {timeZone: 'UTC'}): "-"}</td>
                {row.original.poco_perfurado ? <td className='text-success fw-bold'>Poço Perfurado</td> : 
                <td className='text-warning fw-bold'>Não Perfurado</td>}

                {tableProps.showactions &&(
                  <td>
                    <FontAwesomeIcon icon={faPen} className='btn btn-primary me-2 px-1' onClick={()=>{ Click(row.original)}}/>
                    <FontAwesomeIcon icon={faTrashCan} className='btn btn-danger me-2 px-1' onClick={()=>{ Click(row.original.id, 'delete')}}></FontAwesomeIcon>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};
PocoTable.propTypes = {
  getTableProps: PropTypes.func,
  headers: PropTypes.array,
  page: PropTypes.array,
  prepareRow: PropTypes.func,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  rowClassName: PropTypes.string,
  tableProps: PropTypes.object
};

export default PocoTable;
