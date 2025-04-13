// Basic product page to handle /product requests
export default function ProductPage() {
  return (
    <div>
      <h1>Products</h1>
      <p>Loading products...</p>
    </div>
  );
}

// Separate data fetching/redirection from component rendering
export function getServerSideProps() {
  return {
    redirect: {
      destination: '/api/products/search',
      permanent: false,
    }
  };
} 