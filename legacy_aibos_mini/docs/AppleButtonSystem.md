/* ... existing code ... */

/* Apple's Perfect Button System */
.apple-button {
  @apply inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2;
  @apply active:scale-95;
}

.apple-button-primary {
  @apply apple-button bg-blue-600 text-white hover:bg-blue-700;
  @apply shadow-lg hover:shadow-xl;
  @apply px-4 py-2.5 text-sm;
}

.apple-button-secondary {
  @apply apple-button bg-gray-100 text-gray-900 hover:bg-gray-200;
  @apply dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700;
  @apply border border-gray-200 dark:border-gray-700;
  @apply px-4 py-2.5 text-sm;
}

.apple-button-ghost {
  @apply apple-button text-gray-600 hover:text-gray-900 hover:bg-gray-100;
  @apply dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800;
  @apply px-3 py-2 text-sm;
}

.apple-button-danger {
  @apply apple-button bg-red-600 text-white hover:bg-red-700;
  @apply shadow-lg hover:shadow-xl;
  @apply px-4 py-2.5 text-sm;
}

/* Apple Button Sizes */
.apple-button-sm {
  @apply px-3 py-1.5 text-xs;
}

.apple-button-lg {
  @apply px-6 py-3 text-base;
}

.apple-button-xl {
  @apply px-8 py-4 text-lg;
}