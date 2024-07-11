import { faPencil, faTrash, faTrashCan } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { CloseButton, Modal, Row, Spinner, Table } from "react-bootstrap"
import { useAppContext } from "../../../Main";
import { useEffect, useState } from "react";
import ExpandableCard from "../../../components/Custom/ExpandableCard";
import {CardTitle} from '../../Pipeline/CardInfo';
import SubtleBadge from "../../../components/common/SubtleBadge";
import ModalDelete from "../../../components/Custom/ModalDelete";
import FormEtapa from "./Form";

const Etapas = ({etapas, servicos, contrato}) =>{
    const {config: {theme}} = useAppContext();
    const [modaldel, setModaldel] = useState({show:false, type:''});
    const [modalform, setModalform] = useState({show:false, type:''});

    const submit = (type, data) =>{
        if (type === 'delete'){ 
            setModaldel({show:false})
        }
        setModalform({show:false})
    }

    return(<>
    {servicos.map(s => 
      etapas && etapas.filter(e => parseInt(e.servico) === parseInt(s.value)).length > 0 &&
      <ExpandableCard data={s} attr1='label' key={s.value}>
        <div className="mt-1">
            <CardTitle title='Total do Serviço:'/>
            <span className="ms-2">{Number(etapas.filter(e => parseInt(e.servico) === parseInt(s.value))
                .reduce((total, objeto) => total + objeto.valor, 0)).toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}
            </span>
        </div>
        
        {etapas.filter(e => parseInt(e.servico) === parseInt(s.value)).map(e =>  
            <div key={e.id}>
                <div className='mt-1'>
                    <CardTitle title={e.etapa}/>
                    <FontAwesomeIcon icon={faTrashCan} className="ms-2 modal-editar text-danger" 
                        onClick={() => setModaldel({show:true, link:`${process.env.REACT_APP_API_URL}/finances/contratos-pagamentos-ambiental/${e.id}/`})}
                    />
                </div>
                <div className='mb-1'>
                    <span>{e.percentual}% ({Number(e.valor).toLocaleString('pt-BR', {style:'currency',currency:'BRL'})})</span>
                    <SubtleBadge bg={`${e.color_status}`} className='ms-2'>{e.status}</SubtleBadge>
                </div>
            </div>
        )}
      </ExpandableCard>
    )}
    <ModalDelete show={modaldel.show} link={modaldel.link} close={() => setModaldel({...modaldel, show:false})} 
        update={submit} 
    />
    <Modal
        size="md"
        show={modalform.show}
        onHide={() => setModalform({show:false})}
        dialogClassName="mt-7"
        aria-labelledby="example-modal-sizes-title-lg"
    >
        <Modal.Header>
        <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
            {!modalform.data ? 'Adicionar Etapa' : 'Atualizar Etapa'}
        </Modal.Title>
            <CloseButton onClick={() => setModalform({show:false})}/>
        </Modal.Header>
        <Modal.Body>
            <Row className="flex-center sectionform">
            {contrato && (modalform.data 
                ? <FormEtapa type='edit' contrato={contrato} data={modalform.data} submit={submit}/>
                : <FormEtapa type='add' contrato={contrato} submit={submit}/> 
            )}
            </Row>
        </Modal.Body>
    </Modal>
    </>
    )
}

export default Etapas


export const Processos = ({processos}) =>{
    const {config: {theme}} = useAppContext();

    return(<>
        <span className='text-info ms-1 mt-0'>({processos && processos.length} card(s) em produtos)</span>
        <Table responsive className="mt-1">
            <thead className="bg-300">
                <tr>
                    <th scope="col" className="text-center text-middle">Detalhamento</th>
                    <th scope="col" className="text-center text-middle">Fase</th>
                </tr>
            </thead>
            <tbody className={`${theme === 'light' ? 'bg-light': 'bg-200'}`}>
                {processos && processos.map(p => 
                    <tr key={p.id} style={{cursor:'pointer'}} onClick={() => window.open('/pipeline/'+p.url,'_blank') } 
                        className={`${theme === 'light' ? 'hover-table-light': 'hover-table-dark'} py-0`}
                    >
                        <td className="text-center text-middle fs--2">{p.detalhamento || '-'}</td>
                        <td className="text-center text-middle fs--2">{p.phase || '-'}</td>
                    </tr>
                )} 
            </tbody>
        </Table>
    </>
    )
}
