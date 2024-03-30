// Define a functional component named Pagination that takes three props: items, pageSize, and onPageChange
const Pagination = ({ items, pageSize, onPageChange }) => {
  // Destructure Button from the ReactBootstrap library
  const { Button } = ReactBootstrap;
  
  // If the number of items is less than or equal to 1, return null (no pagination needed)
  if (items.length <= 1) return null;

  // Calculate the total number of pages based on the number of items and page size
  let num = Math.ceil(items.length / pageSize);
  // Create an array of page numbers from 1 to num
  let pages = range(1, num + 1);
  // Map over the pages array to create pagination buttons
  const list = pages.map((page) => {
    return (
      <Button key={page} onClick={onPageChange} className="page-item">
        {page}
      </Button>
    );
  });
  
  // Return a navigation component with pagination buttons
  return (
    <nav>
      <ul className="pagination justify-content-center">{list}</ul>
    </nav>
  );
};

// Define a helper function named range to generate an array of numbers from start to end
const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};

// Define a function named paginate to slice items based on pageNumber and pageSize
function paginate(items, pageNumber, pageSize) {
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;
}

// Define a custom hook named useDataApi to handle data fetching with axios
const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  // Define state using useReducer for handling loading, error, and data fetching
  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });

  // Fetch data from the specified URL using axios when the URL changes
  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};

// Define a reducer function named dataFetchReducer to manage data fetching state
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

// Define the main functional component named App
function App() {
  // Destructure React hooks from the React library
  const { Fragment, useState, useEffect, useReducer } = React;
  // Set initial query state and current page state using useState hook
  const [query, setQuery] = useState('MIT');
  const [currentPage, setCurrentPage] = useState(1);
  // Define page size constant
  const pageSize = 10;
  // Use the custom useDataApi hook to fetch data from a Reddit API endpoint
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "https://www.reddit.com/r/Wallstreetbets/top.json?limit=80&t=2023",
    {
      data: {
        children: [],
      },
    }
  );
  // Define a function to handle page change
  const handlePageChange = (e) => {
    setCurrentPage(Number(e.target.textContent));
  };
  // Slice the data to display the current page of posts
  let page = data.data.children;
  if (page.length >= 1) {
    page = paginate(page, currentPage, pageSize);
    console.log(`currentPage: ${currentPage}`);
  }
  // Return JSX with loading spinner or post list based on loading state
  return (
    <Fragment>
      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="container">
          <table className="table">
            <tbody>
              {page.map((item) => (
                <tr key={item.data.id}>
                  <td style={{ paddingRight: '20px' }}>
                    {/* Conditional rendering for post thumbnail */}
                    {item.data.thumbnail && item.data.thumbnail !== 'self' && item.data.thumbnail !== 'default' ? (
                      <img src={item.data.thumbnail} alt="Preview" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                    ) : (
                      <div className="placeholder" style={{ width: '100px', height: '100px', backgroundColor: '#ccc', textAlign: 'center', lineHeight: '100px' }}>No Preview</div>
                    )}
                  </td>
                  <td style={{ paddingLeft: '20px' }}>
                    {/* Render post title as a link */}
                    <a href={item.data.url} style={{ color: '#0079d3', textDecoration: 'none', marginLeft: '20px' }}>
                      {item.data.title}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Render pagination component */}
      <Pagination
        items={data.data.children}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      ></Pagination>
    </Fragment>
  );
}

// Use ReactDOM.createRoot to render the App component in the root element
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
