import React from 'react';
import PropTypes from 'prop-types';
import { Table, OverlayTrigger, Tooltip } from 'react-bootstrap';
import SubtleBadge from '../../../components/common/SubtleBadge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faPen, faEye, faFilePdf, faCloudArrowDown} from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from "../../../Main";
import * as icons from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';

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

  const renderIcon = (iconName, color) => {
    const IconComponent = icons[iconName];
    return <IconComponent className={'me-2 '+'text-'+color}/>;
  }

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
                className='text-center'
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
              <th className='text-center'>Ações</th>
            )}
            {tableProps.followup &&
              <th className='text-center'>Ações</th>
            }
            {tableProps.alongamento &&
              <th className='text-center'>Ações</th>
            }
          </tr>
        </thead>
        <tbody className={`${bodyClassName} ${theme === 'light' ? 'bg-light': 'bg-200'}`}>
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <tr key={i} className={rowClassName+`${theme === 'light'? ' hover-table-light' : ' hover-table-dark'}`} {...row.getRowProps()} onClick={() => !tableProps.showactions 
              && !tableProps.alongamento && (Click(row.original.id, row.original.uuid))}>
                {row.cells.map((cell, index) => {
                  return (
                    <td
                      key={index}
                      {...cell.getCellProps(cell.column.cellProps)}
                      className='text-center'
                    >
                      {tableProps.index_status && index === tableProps.index_status? 
                      <SubtleBadge bg={row.original.status.color} className='fw-bold'>{row.original.status.text}</SubtleBadge>
                      : cell.value ? 
                      (isDateTime(cell.value) ? new Date(cell.value).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) 
                      +' '+new Date(cell.value).toLocaleTimeString('pt-BR'): 
                      isDate(cell.value) ? new Date(cell.value).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 
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
                {tableProps.followup &&
                  <td className='text-center'>
                    <OverlayTrigger overlay={
                      <Tooltip id="overlay-trigger-example">
                        {row.original.needed_action_text}
                      </Tooltip>
                    }>
                    {renderIcon(row.original.needed_action_icon, row.original.needed_action_color)}
                    </OverlayTrigger>
                  </td>      
                }
                {tableProps.alongamento &&
                  <td className='text-center'>
                    <OverlayTrigger overlay={
                      <Tooltip id="overlay-trigger-example">
                        PDF Alongamento
                      </Tooltip>
                    }>
                      <Link to={`${process.env.REACT_APP_API_URL}/alongamentos/pdf/${row.original.id}`}>
                        <FontAwesomeIcon icon={faFilePdf} className='text-danger me-1'/>
                      </Link>
                    </OverlayTrigger>

                    <OverlayTrigger overlay={
                      <Tooltip className='tooltip-a'>
                        Download Páginas PDF
                      </Tooltip>
                    }>
                      <FontAwesomeIcon icon={faCloudArrowDown} className='text-primary me-1' onClick={()=>{ Click(row.original, 'download')}}/>
                    </OverlayTrigger>
                    <FontAwesomeIcon icon={faPen} className='text-info me-1' onClick={()=>{ Click(row.original, 'edit')}}/>
                    <FontAwesomeIcon icon={faTrashCan} className='text-danger me-1' onClick={()=>{ Click(row.original, 'delete')}}/>
                  </td>      
                }
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
