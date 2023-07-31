const Booking = require("../models/booking-model");
const Tour = require("../models/tour-model");
const User = require("../models/user-model");
const AppError = require("../utils/app-error");
const catchAsync = require("../utils/catch-async");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.body.tourId);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],

    success_url: `${process.env.CLIENT_BASE_URL}/`,
    cancel_url: `${process.env.CLIENT_BASE_URL}/tours/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.body.tourId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "inr",
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            // Note - Images should be hosted to show up in checkout page. So after deploying application, change url of images.
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
      },
    ],
    mode: "payment",
  });

  res.status(201).json({
    status: "success",
    data: {
      session,
    },
  });

  // res.redirect(303, session.url);
});

const createBookingViaCheckout = async (session) => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email }))._id;
  const price = session.amount_total / 100;
  await Booking.create({ tour, user, price });
};

const handleStripeEvents = (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      // Then define and call a function to handle the event
      createBookingViaCheckout(session);
      break;
    // ... handle other event types
    // default:
    //   console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
  // Note - Responses sent from this middleware are sent to Stripe servers.
};

const getAllBookings = catchAsync(async (req, res, next) => {});
const getOneBooking = catchAsync(async (req, res, next) => {});
const createBooking = catchAsync(async (req, res, next) => {});
const updateBooking = catchAsync(async (req, res, next) => {});
const deleteBooking = catchAsync(async (req, res, next) => {});

module.exports = {
  createCheckoutSession,
  handleStripeEvents,
  getOneBooking,
  getAllBookings,
  createBooking,
  deleteBooking,
  updateBooking,
};
