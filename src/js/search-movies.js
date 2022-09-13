import { fetchMovies } from './fetch-movies';
import { renderCardMovies } from './render-movies-card';
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import Notiflix from 'notiflix';

import { pagination } from './pagination';
import { searchEventEmitter } from './pagination';
import { FetchMoviesAPI } from './fetchMoviesAPI';
import { APIEndPoints } from './variables';

import 'notiflix/dist/notiflix-3.2.5.min.css';

const fetchSearchMoviesResultsAPI = new FetchMoviesAPI(
  APIEndPoints.searchMovie
);

const formSearch = document.querySelector('.search-form');
const galleryContainerMovies = document.querySelector('.gallery__box');

const optionError = {
  width: '390px',
  position: 'center-top',
  distance: '145px',
  fontSize: '14px',
  opacity: 1,
  useIcon: false,
  failure: {
    textColor: '#FF001B',
    background: 'rgba(0,0,0,0)',
  },
};

let query = '';
let page = 1;

formSearch.addEventListener('submit', onSearchMovies);

function onSearchMovies(event) {
  event.preventDefault();

  query = event.currentTarget.elements.text.value;
  console.log(query);

  if (query === '') {
    onResultSearchError();
    return;
  }

  Loading.dots({
    svgColor: 'red',
  });

  fetchMovies(query, page).then(({ data }) => {
    console.log(data);

    if (data.total_results === 0) {
      onResultSearchError();
    } else {
      galleryContainerMovies.innerHTML = '';
      renderCardMovies(data.results);
      pagination(data.page, data.total_pages);
      searchEventEmitter.on('pageChange', onPageChange);
      // page += 1;
    }
  });

  Loading.remove();
}

function onResultSearchError() {
  Notiflix.Notify.failure(
    'Search result not successful. Enter the correct movie name.',
    optionError
  );
}

//-------Обработчик клика по кнопке с номером страницы-------

async function onPageChange(event) {
  console.log('event listener(searc)');
  fetchSearchMoviesResultsAPI.page = event;
  fetchSearchMoviesResultsAPI.query = `&query=${query}`;
  let response;

  Loading.dots({
    svgColor: 'red',
  });

  try {
    response = await fetchSearchMoviesResultsAPI.fetchMovies();
  } catch (err) {
    console.log('ERROR: ', err.message);
    console.log('ERROR CODE: ', err.code);
  }

  console.log(response.data);

  clearGalleryMarkup();

  const galleryMarkup = renderCardMovies(response.data.results);

  console.log('within my function');
  console.log(response.data);

  pagination(response.data.page, response.data.total_pages);

  Loading.remove();
}

//-------Функция удаления разметки галлереи-------

function clearGalleryMarkup() {
  galleryContainerMovies.innerHTML = '';
}
