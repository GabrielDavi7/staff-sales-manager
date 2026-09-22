"""Compatibility for Django 5.0 admin inclusion tags rendered by Unfold.

Django's inclusion tags can pass a Context as a layer of another Context.
Unfold 0.90 calls ``flatten()`` on that outer context, which raises ValueError
because Django 5.0 treats the nested Context as an iterable of dictionaries.
"""

from django.template.context import BaseContext


def flatten_admin_context(context):
    values = {}
    for layer in context.dicts:
        if isinstance(layer, BaseContext):
            values.update(flatten_admin_context(layer))
        else:
            values.update(layer)
    return values
