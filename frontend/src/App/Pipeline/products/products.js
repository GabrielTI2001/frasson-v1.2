import KanbanProvider from "../KanbanProvider";
import KanbanContainer from "./KanbanContainer";

function Products() {
    return (
      <KanbanProvider id={1}>
        <div>Products</div>
        <KanbanContainer/>
      </KanbanProvider>
    );
  }
  export default Products;
  