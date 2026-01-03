from django.urls import path
from . import views

app_name = "merchandise"

urlpatterns = [
    path("", views.home, name="home"),
    path("products/", views.products, name="products"),
    path("checkout/", views.checkout, name="checkout"),
]
