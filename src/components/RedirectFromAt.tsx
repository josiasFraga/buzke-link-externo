import { useParams, Navigate } from 'react-router-dom';

export default function RedirectFromAt() {
  const { username } = useParams<{ username: string }>();
  return <Navigate to={`/${username}`} replace />;
}
