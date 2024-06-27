import { Link, useParams } from "react-router-dom";
import KanbanProvider from "../KanbanProvider";
import KanbanContainer from "./KanbanContainer";

function Products() {
  return (
    <KanbanProvider code={518984721}>
      <KanbanContainer/>
    </KanbanProvider>
  );
  }
  export default Products;
  