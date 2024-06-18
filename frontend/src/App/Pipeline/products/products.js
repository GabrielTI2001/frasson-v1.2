import { Link } from "react-router-dom";
import KanbanProvider from "../KanbanProvider";
import KanbanContainer from "./KanbanContainer";

function Products() {
    return (
      <KanbanProvider id={1}>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/home'}>Home</Link>
            </li>
            <li className="breadcrumb-item fw-bold" aria-current="page">
              Fluxo - Produtos
            </li>  
        </ol>
        <KanbanContainer/>
      </KanbanProvider>
    );
  }
  export default Products;
  