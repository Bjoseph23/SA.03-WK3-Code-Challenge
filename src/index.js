// Your code here
document.addEventListener("DOMContentLoaded", () => {
    // DOM elements
    const movieList = document.getElementById("film-List");
    const movieDetails = document.querySelector("#showing");
    const buyTicketButton = document.getElementById("buy-ticket");
    const deleteMovieButton = document.getElementById("delete-movie");
    const movieImage = document.getElementById("poster");
    const movieDescription = document.querySelector("#film-info");

    // Variables to store movie that is currently selected
    let currentMovie = null;
    let moviesData = [];

    // Function to display movie details
    function displayMovieDetails(movie) {
        movieImage.src = `${movie.poster}`
        movieImage.alt=`${movie.title} `
  
        movieDescription.innerHTML = `
            <h2>${movie.title}</h2>
            <p>Runtime: ${movie.runtime}</p>
            <p>Showtime: ${movie.showtime}</p>
            <p>Available Tickets: ${movie.capacity - movie.tickets_sold}</p>
            `;

        // Update the button text based on available tickets
        if (movie.tickets_sold >= movie.capacity) {
            buyTicketButton.textContent = "Sold Out";
            buyTicketButton.setAttribute("disabled", "true");
        } else {
            buyTicketButton.textContent = "Buy Ticket";
            buyTicketButton.removeAttribute("disabled");
        }

        // Enable the "Delete Movie" button
        deleteMovieButton.removeAttribute("disabled");
    }

    function buyTicket() {
        if (currentMovie) {
            // Check if there are available tickets
            if (currentMovie.tickets_sold < currentMovie.capacity) {
                // Update the sold tickets count
                currentMovie.tickets_sold++; // increment the tickets sold value
                updateTicketInfo(currentMovie);
            }
        }
    }

    function updateTicketInfo(movie) {
        if (movie) {
            fetch(`http://localhost:3000/films/${movie.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(movie),
            })
                .then((resp) => resp.json())
                .then((updatedMovie) => {
                    currentMovie = updatedMovie;
                    displayMovieDetails(updatedMovie);
                })
                .catch((error) => {
                    console.error("Update error:", error);
                });
        }
    }

    // Function to Delete Movie
    function deleteCurrentMovie() {
        if (currentMovie) {
            // Send a DELETE request to remove the movie from the server
            fetch(`http://localhost:3000/films/${currentMovie.id}`, {
                method: "DELETE",
            })
                .then((resp) => resp.json())
                .then(() => {
                    // Remove movie from local data
                    const index = moviesData.findIndex((m) => m.id === currentMovie.id);
                    if (index !== -1) {
                        moviesData.splice(index, 1);
                    }

                    // Clear currentMovie
                    currentMovie = null;
                    movieImage.innerHTML = "";
                    movieDescription.innerHTML = "";

                    // Disable the two buttons
                    buyTicketButton.setAttribute("disabled", "true");
                    deleteMovieButton.setAttribute("disabled", "true");

                    updateMovieList();

                    // Display details of the first movie
                    if (moviesData.length > 0) {
                        currentMovie = moviesData[0];
                        displayMovieDetails(currentMovie);
                    }
                    //catch any errors that may come about
                })
                .catch((error) => {
                    console.error("The Delete button error occured:", error);
                });
        }
    }

    // Functions to update Movie List
    function updateMovieList() {
        movieList.innerHTML = "";

        moviesData.forEach((movie) => {
            const li = document.createElement("li");
            li.textContent = movie.title;

            // Event listener for <li> element
            li.addEventListener("click", () => {
                currentMovie = movie;
                displayMovieDetails(movie);
            });

            movieList.appendChild(li);
        });
    }

    /// Make a GET request to the JSON server when the content is loaded
  fetch("http://localhost:3000/films")
  .then((response) => {
      if (!response.ok) {
          throw new Error("Network response was not ok");
      }
      return response.json();
  })
  .then((data) => {
      // Check if the data is an array of movies
      if (Array.isArray(data)) {
          moviesData = data; // Store the movie data

          // Display the details of the first movie by default if available
          if (data.length > 0) {
              currentMovie = data[0];
              displayMovieDetails(currentMovie);
          }

          // Update the movie list
          updateMovieList();

          // Add a click event listener to the "Buy Ticket" button
          buyTicketButton.addEventListener("click", buyTicket);

          // Add a click event listener to the "Delete Movie" button
          deleteMovieButton.addEventListener("click", deleteCurrentMovie);
      } else {
          movieList.innerHTML =
              "<li>Invalid JSON format. Expected an array of movies.</li>";
      }
  })
  .catch((error) => {
      console.error("Fetch error:", error);
      movieList.innerHTML = "<li>Error fetching data.</li>";
  });
});
