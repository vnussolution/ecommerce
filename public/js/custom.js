/**
 * Created by M6600 on 6/15/2016.
 */
$(function () {

	// public key for stripe
	Stripe.setPublishableKey('pk_test_qIxLpagnjQbyC0pfFWqMLHCM');

	// use spin.js
	var opts = {
		lines: 9 // The number of lines to draw
		, length: 56 // The length of each line
		, width: 33 // The line thickness
		, radius: 56 // The radius of the inner circle
		, scale: 1.5 // Scales overall size of the spinner
		, corners: 1 // Corner roundness (0..1)
		, color: '#000' // #rgb or #rrggbb or array of colors
		, opacity: 0.3 // Opacity of the lines
		, rotate: 37 // The rotation offset
		, direction: 1 // 1: clockwise, -1: counterclockwise
		, speed: 1 // Rounds per second
		, trail: 60 // Afterglow percentage
		, fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
		, zIndex: 2e9 // The z-index (defaults to 2000000000)
		, className: 'spinner' // The CSS class to assign to the spinner
		, top: '49%' // Top position relative to parent
		, left: '50%' // Left position relative to parent
		, shadow: false // Whether to render a shadow
		, hwaccel: false // Whether to use hardware acceleration
		, position: 'absolute' // Element positioning
	};


	function searchItem () {
		var search_term = $('#search').val();
		console.log(' search_term : ',search_term);
		$.ajax({
			method: 'POST',
			url: '/api/search',
			data: {
				search_term: search_term
			},
			dataType: 'json',
			success: function (json) {
				var data = json.hits.hits.map(function (hit) {
					return hit;
				});

				var htmlResults = '';
				console.log(' searching.... : ',data);
				$('#searchResults').empty();
				$('#countResults').empty();
				//$('#searchResults').append(html);
				for (var i = 0; i < data.length; i++) {
					var html = '';
					html += '<div class="col-md-4">';
					html += '<a href="/product/' + data[i]._id + '">';
					html += '<div class="thumbnail">';
					html += '<img src="' + data[i].image + '" alt=""/>';
					html += '<div class="caption">';
					html += '<h3>' + data[i].name + '</h3>';
					//html += '<p>' + data[i]._source.category.name + '</p>';
					html += '<p>' + data[i].price + '</p>';
					html += '</div></div></a></div>';
					$('#searchResults').append(html);

				}
				if (!data) {
					htmlResults += '<h3> No results found</h3>';
				} else {
					htmlResults += '<h3>' + data.length + ' results found.</h3>';
				}
				$('#countResults').append(htmlResults);
				console.log(' done.. 1');
			},
			error: function (error) {
				console.log('custom.js search error:: ',error);
			}

		});

		console.log(' done.. ');
	}

	$(document).on('click','#btnSearch', function () {
		searchItem();
	});
	// used in navbar , home to add event for searching products
	$('#search').keyup(function (e) {
		if(e.keyCode === 13) return searchItem();

	});

	// used in product/:id  to calculate the price
	$(document).on('click', '#minus', function (e) {
		e.preventDefault(); //  stops the default action of an element from happening.

		var priceValue = parseFloat($('#priceValue').val());
		var quantity = parseInt($('#quantity').val());

		if (quantity == 1) {
			priceValue = parseFloat($('#priceHidden').val());
			quantity = 1;
		} else {
			priceValue -= parseFloat($('#priceHidden').val());
			quantity -= 1;
		}

		$('#quantity').val(quantity);
		$('#priceValue').val(priceValue.toFixed(2));
		$('#total').html(quantity);
	});

	// used in product/:id  to calculate the price
	$(document).on('click', '#plus', function (e) {
		e.preventDefault(); //  stops the default action of an element from happening.

		var priceValue = parseFloat($('#priceValue').val());
		var quantity = parseInt($('#quantity').val());

		//max is 5
		if (quantity == 5) {
			priceValue = parseFloat($('#priceHidden').val()) * 5;
			quantity = 5;
		} else {
			priceValue += parseFloat($('#priceHidden').val());
			quantity += 1;
		}

		$('#quantity').val(quantity);
		$('#priceValue').val(priceValue.toFixed(2));
		$('#total').html(quantity);
	});


	//Step 3: Sending the form to your server
	function stripeResponseHandler(status, response) {
		// Grab the form:
		var $form = $('#payment-form');

		console.log(' stripeResponseHandler ..');
		if (response.error) { // Problem!

			// Show the errors on the form:
			$form.find('.payment-errors').text(response.error.message);
			$form.find('#submitBtn').prop('disabled', false); // Re-enable submission

		} else { // Token was created!

			// Get the token ID:
			var token = response.id;

			// Insert the token ID into the form so it gets submitted to the server:
			$form.append($('<input type="hidden" name="stripeToken">').val(token));

			var spinner = new Spinner(opts).spin();
			$('#loading').append(spinner.el);

			// Submit the form:
			$form.get(0).submit();
		}
	};

	// step 2: - create a single use token
	var $form = $('#payment-form');
	$form.submit(function (event) {
		// Disable the submit button to prevent repeated clicks:
		$form.find('#submitBtn').prop('disabled', true);

		// Request a token from Stripe:
		console.log('step 2 .. Cookie : ',document.cookie);
		Stripe.card.createToken($form, stripeResponseHandler);

		// Prevent the form from being submitted:
		return false;
	});

});