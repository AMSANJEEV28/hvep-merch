from django.shortcuts import render

def home(request):
    return render(request, "merchandise/home.html")

def products(request):
    return render(request, "merchandise/products.html")

def checkout(request):
    return render(request, "merchandise/checkout.html")
