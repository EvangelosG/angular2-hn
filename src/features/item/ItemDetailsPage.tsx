import { useParams } from 'react-router-dom';

// Placeholder: replaced by the item agent (port of item-details + comment).
export function ItemDetailsPage() {
    const { id } = useParams<'id'>();
    return <div>Item placeholder: {id}</div>;
}

export default ItemDetailsPage;
