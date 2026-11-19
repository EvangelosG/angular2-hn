import { useParams } from 'react-router-dom';

// Placeholder: replaced by the user agent (port of user).
export function UserPage() {
    const { id } = useParams<'id'>();
    return <div>User placeholder: {id}</div>;
}

export default UserPage;
