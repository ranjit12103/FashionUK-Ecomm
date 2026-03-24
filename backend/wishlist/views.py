from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import WishlistItem
from .serializers import WishlistItemSerializer


class WishlistListView(generics.ListAPIView):
    """GET /api/wishlist/"""
    serializer_class   = WishlistItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            WishlistItem.objects
            .filter(user=self.request.user)
            .select_related('product__category')
            .prefetch_related('product__images', 'product__variants')
        )


class WishlistAddView(generics.CreateAPIView):
    """POST /api/wishlist/add/  — body: { product_id }"""
    serializer_class   = WishlistItemSerializer
    permission_classes = [IsAuthenticated]


class WishlistRemoveView(APIView):
    """DELETE /api/wishlist/<product_id>/remove/"""
    permission_classes = [IsAuthenticated]

    def delete(self, request, product_id):
        try:
            item = WishlistItem.objects.get(user=request.user, product_id=product_id)
            item.delete()
            return Response({'detail': 'Removed from wishlist.'}, status=status.HTTP_200_OK)
        except WishlistItem.DoesNotExist:
            return Response({'detail': 'Item not in wishlist.'}, status=status.HTTP_404_NOT_FOUND)


class WishlistCheckView(APIView):
    """GET /api/wishlist/check/<product_id>/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, product_id):
        in_wishlist = WishlistItem.objects.filter(
            user=request.user, product_id=product_id
        ).exists()
        return Response({'in_wishlist': in_wishlist})


class WishlistClearView(APIView):
    """DELETE /api/wishlist/clear/"""
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        WishlistItem.objects.filter(user=request.user).delete()
        return Response({'detail': 'Wishlist cleared.'}, status=status.HTTP_200_OK)