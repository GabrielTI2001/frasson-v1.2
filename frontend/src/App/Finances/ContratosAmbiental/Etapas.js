import { useAppContext } from "../../../Main";
import ExpandableCard from "../../../components/Custom/ExpandableCard";
import CardInfo, {CardTitle} from '../../Pipeline/CardInfo';
import SubtleBadge from "../../../components/common/SubtleBadge";

const Etapas = ({etapas, servicos}) =>{
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
                </div>
                <div className='mb-1'>
                    <span>{e.percentual}% ({Number(e.valor).toLocaleString('pt-BR', {style:'currency',currency:'BRL'})})</span>
                    <SubtleBadge bg={`${e.color_status}`} className='ms-2'>{e.status}</SubtleBadge>
                </div>
            </div>
        )}
      </ExpandableCard>
    )}
    </>
    )
}

export default Etapas


export const Processos = ({processos}) =>{
    const {config: {theme}} = useAppContext();

    return(<>
        <span className='ms-1 mt-0'>{processos && processos.length} card(s) em produtos</span>
        {processos && processos.map(p => 
            <div className="rounded-top-lg pt-1 pb-0 mb-2">
                <CardInfo data={p} title2='Em: ' attr1='detalhamento' attr2='phase' url='pipeline/518984721/processo'/>
            </div>
        )} 
    </>
    )
}
