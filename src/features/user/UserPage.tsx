import { useParams } from 'react-router-dom';

// STUB (owned by the user agent): port of user/user.component.
export function UserPage() {
    const { id } = useParams<{ id: string }>();
    return <div data-testid="user-page-stub">User {id}</div>;
}
