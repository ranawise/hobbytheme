@extends('layouts.admin')

@section('title')
    Server Icons
@endsection

@section('content-header')
    <h1>Server Icons<small>Manage icons users can purchase and equip on their servers.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Icons</li>
    </ol>
@endsection

@section('content')
<div class="row">
    <div class="col-xs-12">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title">Icon List</h3>
                <div class="box-tools">
                    <button class="btn btn-sm btn-primary" data-toggle="modal" data-target="#newIconModal">Create New</button>
                </div>
            </div>
            <div class="box-body table-responsive no-padding">
                <table class="table table-hover">
                    <tbody>
                        <tr>
                            <th>Preview</th>
                            <th>Name</th>
                            <th>Rarity</th>
                            <th class="text-center">Credit Cost</th>
                            <th class="text-center">Available</th>
                            <th class="text-center">Available Until</th>
                            <th class="text-center">Owners</th>
                        </tr>
                        @foreach ($icons as $icon)
                        <tr>
                            <td style="width:48px">
                                <img src="{{ $icon->image_url }}" alt="{{ $icon->name }}" style="width:40px;height:40px;object-fit:contain;border-radius:6px;background:#1a1a1a;padding:2px">
                            </td>
                            <td><a href="{{ route('admin.icons.view', $icon->id) }}">{{ $icon->name }}</a></td>
                            <td>
                                @php
                                    $rarityColors = [
                                        'COMMON'    => '#9e9e9e',
                                        'UNCOMMON'  => '#4caf50',
                                        'RARE'      => '#2196f3',
                                        'EPIC'      => '#9c27b0',
                                        'LEGENDARY' => '#ff9800',
                                        'LIMITED'   => '#f44336',
                                    ];
                                    $color = $rarityColors[$icon->rarity] ?? '#9e9e9e';
                                @endphp
                                <span style="color:{{ $color }};font-weight:600">{{ $icon->rarity }}</span>
                            </td>
                            <td class="text-center">{{ number_format($icon->credit_cost) }}</td>
                            <td class="text-center">{!! $icon->available ? '<i class="fa fa-check text-green"></i>' : '<i class="fa fa-times text-red"></i>' !!}</td>
                            <td class="text-center">{{ $icon->available_until ? $icon->available_until->format('Y-m-d') : '—' }}</td>
                            <td class="text-center">{{ $icon->owners_count }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

{{-- Create Modal --}}
<div class="modal fade" id="newIconModal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
                <h4 class="modal-title">Create New Icon</h4>
            </div>
            <form action="{{ route('admin.icons') }}" method="POST">
                <div class="modal-body">
                    {!! csrf_field() !!}
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" name="name" class="form-control" required placeholder="e.g. Dragon Shield">
                    </div>
                    <div class="form-group">
                        <label>Rarity</label>
                        <select name="rarity" class="form-control" required>
                            <option value="COMMON">Common</option>
                            <option value="UNCOMMON">Uncommon</option>
                            <option value="RARE">Rare</option>
                            <option value="EPIC">Epic</option>
                            <option value="LEGENDARY">Legendary</option>
                            <option value="LIMITED">Limited</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Image URL</label>
                        <input type="url" name="image_url" class="form-control" required placeholder="https://cdn.example.com/icons/dragon.png">
                        <p class="text-muted small">Link to a PNG/WebP image (64×64 or 128×128 recommended).</p>
                    </div>
                    <div class="form-group">
                        <label>Credit Cost</label>
                        <input type="number" name="credit_cost" class="form-control" min="0" value="500" required>
                    </div>
                    <div class="form-group">
                        <label>Available Until (optional)</label>
                        <input type="date" name="available_until" class="form-control">
                        <p class="text-muted small">Leave blank for no expiry. Set to a date to make this a limited-time icon.</p>
                    </div>
                    <div class="form-group">
                        <label><input type="hidden" name="available" value="0"><input type="checkbox" name="available" value="1" checked> Available for purchase</label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default pull-left" data-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Create Icon</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
