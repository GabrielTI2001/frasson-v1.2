import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import SubtleBadge from '../../../components/common/SubtleBadge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faPen, faEye} from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from "../../../Main";
import { format } from 'date-fns';

const AdvanceTable = ({
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

  const isDate = (dado) =>{
    if (dado && typeof(dado) === "string"){
      if (dado.charAt(4) === '-' && dado.charAt(7) === '-'){
        return true
      }
      else{
        return false
      }
    }
  }

  const isDecimal = (dado) =>{
    return /^\d*\.\d+$/.test(dado);
  }

  const isDateTime = (dado) =>{
    if (dado && typeof(dado) === "string"){
      if (isDate(dado) && dado.charAt(13) === ':' && dado.charAt(16) === ':'){
        return true
      }
      else{
        return false
      }
    }
  }

  return (
    <div className="table-responsive scrollbar fs-xs">
      <Table {...getTableProps(tableProps)}>
        <thead className={headerClassName+' bg-300'}>
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
            {tableProps.showactions &&(
              <th>Ações</th>
            )}
          </tr>
        </thead>
        <tbody className={`${bodyClassName} ${theme === 'light' ? 'bg-light': 'bg-200'}`}>
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
                      className={`${!cell.value && 'text-center'}`}
                    >
                      {tableProps.index_status && index === tableProps.index_status? 
                      <SubtleBadge bg={row.original.status.color} className='fw-bold'>{row.original.status.text}</SubtleBadge>
                      : cell.value ? 
                      (isDateTime(cell.value) ? format(new Date(cell.value), 'dd/MM/yyyy hh:mm') : 
                      isDate(cell.value) ? format(new Date(cell.value), 'dd/MM/yyyy') : 
                      isDecimal(cell.value) ? Number(cell.value).toLocaleString('pt-BR',{minimumFractionDigits: 2, maximumFractionDigits:2}) :
                      cell.render('Cell')) 
                      : '-'}
                    </td>
                  );
                })}
                {tableProps.showactions &&(
                  <td className='text-center'>
                    {tableProps.showview && 
                    <FontAwesomeIcon icon={faEye} className='btn btn-success me-2 px-1' onClick={()=>{ Click(row.original, 'view')}}></FontAwesomeIcon>
                    }
                    <FontAwesomeIcon icon={faPen} className='btn btn-primary me-2 px-1' onClick={()=>{ Click(row.original, 'edit')}}/>
                    <FontAwesomeIcon icon={faTrashCan} className='btn btn-danger me-2 px-1' onClick={()=>{ Click(row.original, 'delete')}}></FontAwesomeIcon>
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
AdvanceTable.propTypes = {
  getTableProps: PropTypes.func,
  headers: PropTypes.array,
  page: PropTypes.array,
  prepareRow: PropTypes.func,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  rowClassName: PropTypes.string,
  tableProps: PropTypes.object
};

export default AdvanceTable;
