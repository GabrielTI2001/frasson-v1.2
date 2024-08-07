import Breadcrumbs from '@mui/material/Breadcrumbs';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const CustomBreadcrumb = ({children}) => {
    return (
    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} className="fs--1 mb-2 w-50" aria-label="breadcrumb">
        {children}
    </Breadcrumbs>
    )
}
export default CustomBreadcrumb;
