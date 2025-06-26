// src/components/ProtectedRoute.jsx

const ProtectedRoute = ({ children }) => {

    if (isLoading) return <div>Loading...</div>;


    return children;
};

export default ProtectedRoute;
