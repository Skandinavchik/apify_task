// 1. Ky library(less size than axios) for fetching data and getting rid of ugly plain 'fetch API'.
import ky from 'ky';


const apiUrl = 'https://api.ecommerce.com/products';
const initMinPrice = 0;
const initMaxPrice = 100000;

let products = [];

// 2. Defining an async function which takes minPrice and maxPrice as args.
//    Args specify the price range for the current API request.

const fetchProducts = async (minPrice, maxPrice) => {
    // 3. Constructing url with current minPrice and maxPrice
    const url = `${apiUrl}?minPrice=${minPrice}&maxPrice=${maxPrice}`;

    // 4. Making a one line call directly without having to await Response first.
    //    Also throws an error if status code is out of range (200...299).
    const data = await ky.get(url).json();

    // 5. Using switch instead of if statement to get code more readable.
    //    The main idea is to call API, decreasing maxPrice every call until
    //    I get total products which amount is not greater than limit in current price range.
    //    After matching this statement price range is moving forward. So maxPrice (from
    //    previouse price range) becomes minPrice in current range and initial maxPrice
    //    returns as a maxPrice until all products are scraped.

    switch (true) {
        // Executing function if there are still products in current price range.
        case data.total > data.count:
            const floatMaxPrice = Math.ceil((maxPrice - minPrice) / 2 + minPrice) - 0.01;
            await fetchProducts(minPrice, floatMaxPrice);
            break;

        // Pushing products into array and moving price range forward
        // if all products are scraped in current price range.
        case data.total === data.count && maxPrice !== initMaxPrice:
            products.push(...data.products);
            await fetchProducts(Math.ceil(maxPrice), initMaxPrice);
            break;

        // Pushing products into array and finishing the execution
        // if all products are scraped from the last price range.
        case data.total === data.count && maxPrice === initMaxPrice:
            products.push(...data.products);
            console.log('Job is done');
            break;

        default:
            throw new Error('Something went wrong!');
    };
};

fetchProducts(initMinPrice, initMaxPrice)
    .then(() => console.log(products))
    .catch(err => console.log(err.message));