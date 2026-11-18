import { useParams } from 'react-router-dom';

// STUB (owned by the item agent): port of item-details + item-details/comment.
export function ItemDetailsPage() {
    const { id } = useParams<{ id: string }>();
    return <div data-testid="item-details-page-stub">Item {id}</div>;
}
