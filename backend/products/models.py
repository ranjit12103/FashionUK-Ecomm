import uuid
from django.db import models
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings


# ════════════════════════════════════════════
# CATEGORY
# ════════════════════════════════════════════

class Category(models.Model):
    name           = models.CharField(max_length=100, unique=True)
    slug           = models.SlugField(max_length=120, unique=True, blank=True)
    description    = models.TextField(blank=True)
    image          = models.ImageField(upload_to='categories/', blank=True, null=True)
    bg_color       = models.CharField(max_length=20, blank=True, default='#f5f5f5')
    text_color     = models.CharField(max_length=20, blank=True, default='#1a1a1a')
    is_active      = models.BooleanField(default=True)
    display_order  = models.PositiveIntegerField(default=0)
    meta_title     = models.CharField(max_length=160, blank=True)
    meta_desc      = models.CharField(max_length=300, blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'Categories'
        ordering = ['display_order', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# ════════════════════════════════════════════
# BRAND
# ════════════════════════════════════════════

class Brand(models.Model):
    name        = models.CharField(max_length=100, unique=True)
    slug        = models.SlugField(max_length=120, unique=True, blank=True)
    logo        = models.ImageField(upload_to='brands/', blank=True, null=True)
    description = models.TextField(blank=True)
    is_active   = models.BooleanField(default=True)

    class Meta:
        db_table = 'brands'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# ════════════════════════════════════════════
# TAG
# ════════════════════════════════════════════

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=60, unique=True, blank=True)

    class Meta:
        db_table = 'tags'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# ════════════════════════════════════════════
# SIZE
# ════════════════════════════════════════════

class Size(models.Model):
    SIZE_TYPE_CHOICES = [
        ('alpha',        'Alpha (XS/S/M/L/XL)'),
        ('numeric',      'Numeric (28/30/32...)'),
        ('waist_length', 'Waist x Length (32x32)'),
    ]
    name          = models.CharField(max_length=20, unique=True)
    size_type     = models.CharField(max_length=20, choices=SIZE_TYPE_CHOICES, default='alpha')
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'sizes'
        ordering = ['display_order']

    def __str__(self):
        return self.name


# ════════════════════════════════════════════
# COLOUR
# ════════════════════════════════════════════

class Colour(models.Model):
    name          = models.CharField(max_length=50, unique=True)
    hex_code      = models.CharField(max_length=7, blank=True, help_text='e.g. #FFFFFF')
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'colours'
        ordering = ['display_order', 'name']

    def __str__(self):
        return self.name


# ════════════════════════════════════════════
# PRODUCT
# ════════════════════════════════════════════

class Product(models.Model):
    FIT_CHOICES = [
        ('slim',      'Slim Fit'),
        ('regular',   'Regular Fit'),
        ('relaxed',   'Relaxed Fit'),
        ('wide',      'Wide Fit'),
        ('straight',  'Straight Fit'),
        ('tapered',   'Tapered Fit'),
        ('skinny',    'Skinny Fit'),
        ('oversized', 'Oversized'),
    ]

    BADGE_CHOICES = [
        ('',           'None'),
        ('new',        'New'),
        ('sale',       'Sale'),
        ('trending',   'Trending'),
        ('bestseller', 'Best Seller'),
        ('limited',    'Limited Edition'),
        ('exclusive',  'Exclusive'),
    ]

    GENDER_CHOICES = [
        ('men',    'Men'),
        ('unisex', 'Unisex'),
    ]

    # ── Identifiers ───────────────────────────
    sku  = models.CharField(max_length=50, unique=True, blank=True)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, blank=True)

    # ── Content ───────────────────────────────
    description       = models.TextField(blank=True)
    short_description = models.CharField(max_length=300, blank=True)
    material          = models.CharField(max_length=200, blank=True)
    care_instructions = models.TextField(blank=True)
    country_of_origin = models.CharField(max_length=100, blank=True, default='India')

    # ── Relations ─────────────────────────────
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    brand    = models.ForeignKey(Brand,    on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    tags     = models.ManyToManyField(Tag, blank=True, related_name='products')

    # ── Pricing ───────────────────────────────
    # original_price  = full / RRP price — always required
    # price           = current selling price  (< original_price → on sale)
    # discount_value  = ₹ saved               (computed property)
    # discount_percent= % saved               (computed property)
    original_price = models.DecimalField(
        max_digits=8, decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text='Full / RRP price. Always set this.'
    )
    price = models.DecimalField(
        max_digits=8, decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text='Current selling price. Set lower than original_price to create a sale.'
    )

    # ── Style ─────────────────────────────────
    fit    = models.CharField(max_length=20, choices=FIT_CHOICES, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='men')

    # ── Merchandising ─────────────────────────
    badge    = models.CharField(max_length=20, choices=BADGE_CHOICES, blank=True, default='')
    bg_color = models.CharField(max_length=20, blank=True, default='#f5f5f5',
                                help_text='Card background colour shown before image loads')

    # ── Status flags ──────────────────────────
    is_active      = models.BooleanField(default=True)
    is_featured    = models.BooleanField(default=False)
    is_new         = models.BooleanField(default=False)
    is_bestseller  = models.BooleanField(default=False)

    # ── Analytics (denormalised counters) ─────
    view_count     = models.PositiveIntegerField(default=0)
    sold_count     = models.PositiveIntegerField(default=0)
    wishlist_count = models.PositiveIntegerField(default=0)

    # ── SEO ───────────────────────────────────
    meta_title = models.CharField(max_length=160, blank=True)
    meta_desc  = models.CharField(max_length=300, blank=True)

    # ── Timestamps ────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'products'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.sku:
            self.sku = f'FUK-{uuid.uuid4().hex[:8].upper()}'
        if not self.slug:
            base, slug, n = slugify(self.name), slugify(self.name), 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base}-{n}'
                n += 1
            self.slug = slug
        super().save(*args, **kwargs)

    # ── Pricing computed ──────────────────────
    @property
    def is_on_sale(self):
        """True only when both prices exist and current price is below RRP."""
        if self.price is None or self.original_price is None:
            return False
        return self.price < self.original_price

    @property
    def discount_value(self):
        """₹ amount saved. Returns 0.00 when not on sale or prices missing."""
        if not self.is_on_sale:
            return 0.00
        return round(self.original_price - self.price, 2)

    @property
    def discount_percent(self):
        """% saved rounded to nearest integer. Returns 0 when not on sale."""
        if not self.is_on_sale or self.original_price == 0:
            return 0
        return round(((self.original_price - self.price) / self.original_price) * 100)

    # ── Image helpers ─────────────────────────
    @property
    def primary_image(self):
        img = self.images.filter(is_primary=True).first() or self.images.first()
        return img.image.url if img else None

    # ── Review helpers ────────────────────────
    @property
    def average_rating(self):
        qs = self.reviews.filter(is_approved=True)
        return round(sum(r.rating for r in qs) / qs.count(), 1) if qs.exists() else 0.0

    @property
    def review_count(self):
        return self.reviews.filter(is_approved=True).count()

    # ── Stock helpers ─────────────────────────
    @property
    def is_in_stock(self):
        return self.variants.filter(stock__gt=0).exists()

    @property
    def total_stock(self):
        return sum(v.stock for v in self.variants.all())

    def __str__(self):
        return self.name


# ════════════════════════════════════════════
# PRODUCT IMAGE
# ════════════════════════════════════════════

class ProductImage(models.Model):
    product       = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image         = models.ImageField(upload_to='products/images/')
    alt_text      = models.CharField(max_length=200, blank=True)
    is_primary    = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(default=0)
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'product_images'
        ordering = ['display_order', 'created_at']

    def save(self, *args, **kwargs):
        if self.is_primary:
            ProductImage.objects.filter(
                product=self.product, is_primary=True
            ).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.product.name} — Image {self.display_order}'


# ════════════════════════════════════════════
# PRODUCT VARIANT
# ════════════════════════════════════════════

class ProductVariant(models.Model):
    product        = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    colour         = models.ForeignKey(Colour,  on_delete=models.SET_NULL, null=True, blank=True, related_name='variants')
    size           = models.ForeignKey(Size,    on_delete=models.SET_NULL, null=True, blank=True, related_name='variants')
    variant_sku    = models.CharField(max_length=80, unique=True, blank=True)
    stock          = models.PositiveIntegerField(default=0)
    price_override = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True,
        help_text='Leave blank to inherit product price'
    )
    image     = models.ImageField(upload_to='products/variants/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'product_variants'
        unique_together = [['product', 'colour', 'size']]
        ordering = ['colour', 'size']

    def save(self, *args, **kwargs):
        if not self.variant_sku:
            c = self.colour.name[:3].upper() if self.colour else 'NA'
            s = self.size.name.upper() if self.size else 'OS'
            self.variant_sku = f'{self.product.sku}-{c}-{s}'
        super().save(*args, **kwargs)

    @property
    def effective_price(self):
        return self.price_override if self.price_override else self.product.price

    @property
    def is_in_stock(self):
        return self.stock > 0

    @property
    def is_low_stock(self):
        return 0 < self.stock <= 3

    def __str__(self):
        parts = [self.product.name]
        if self.colour: parts.append(self.colour.name)
        if self.size:   parts.append(self.size.name)
        return ' / '.join(parts)


# ════════════════════════════════════════════
# PRODUCT REVIEW
# ════════════════════════════════════════════

class ProductReview(models.Model):
    product               = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user                  = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    rating                = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title                 = models.CharField(max_length=150, blank=True)
    comment               = models.TextField(blank=True)
    image                 = models.ImageField(upload_to='reviews/', blank=True, null=True)
    is_verified_purchase  = models.BooleanField(default=False)
    is_approved           = models.BooleanField(default=False)
    helpful_count         = models.PositiveIntegerField(default=0)
    created_at            = models.DateTimeField(auto_now_add=True)
    updated_at            = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'product_reviews'
        unique_together = [['product', 'user']]
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} → {self.product.name} ({self.rating}★)'